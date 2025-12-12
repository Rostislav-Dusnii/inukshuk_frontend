import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '../LoginForm'
import AuthService from '@services/AuthService'

// Mock the UserService module
jest.mock('@services/AuthService')
const mockLoginUser = AuthService.loginUser as jest.MockedFunction<typeof AuthService.loginUser>

// Mock react-google-recaptcha-v3
const mockExecuteRecaptcha = jest.fn()
jest.mock('react-google-recaptcha-v3', () => ({
  useGoogleReCaptcha: () => ({
    executeRecaptcha: mockExecuteRecaptcha,
  }),
}))

// create push mock; we'll spy on next/router.useRouter in beforeEach
const pushMock = jest.fn()

// Helper function to create mock Response objects
const createMockResponse = (status: number, data: unknown): Response => {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => data,
    headers: new Headers(),
    redirected: false,
    statusText: status === 200 ? 'OK' : 'Error',
    type: 'basic',
    url: '',
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    text: jest.fn(),
    bytes: jest.fn(),
  } as unknown as Response
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorage.clear()
    // Ensure real timers by default
    jest.useRealTimers()

    // Mock executeRecaptcha to return a fake token
    mockExecuteRecaptcha.mockResolvedValue('fake-recaptcha-token')

    // spy on next/router.useRouter to return our push mock
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nextRouter = require('next/router')
    jest.spyOn(nextRouter, 'useRouter').mockReturnValue({ push: pushMock })
  })

  afterEach(() => {
    // restore any spied implementations and reset push mock calls
    jest.restoreAllMocks()
    pushMock.mockReset()
  })

  it('renders username and password fields and the login button', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('successful login sets sessionStorage and redirects', async () => {
    // Use fake timers to control setTimeout
    jest.useFakeTimers()

    mockLoginUser.mockResolvedValue(
      createMockResponse(200, { token: 'abc123', username: 'tester' })
    )

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'tester' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Login successful/i)).toBeInTheDocument()
    })

    // Advance timers to trigger redirect
    jest.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/')
    })

    const stored = sessionStorage.getItem('loggedInUser')
    expect(stored).toBeTruthy()
    // assert exact stored shape
    expect(JSON.parse(stored as string)).toEqual({ token: 'abc123', username: 'tester' })

    // restore timers to real
    jest.useRealTimers()
  })

  it('shows server-provided error message on 401', async () => {
    mockLoginUser.mockResolvedValue(
      createMockResponse(401, { errorMessage: 'Bad credentials' })
    )

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'bad' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/Bad credentials/i)).toBeInTheDocument()
    })

    // ensure sessionStorage not set
    expect(sessionStorage.getItem('loggedInUser')).toBeNull()
  })

  it('shows fallback error when 401 response cannot be parsed as JSON', async () => {
    mockLoginUser.mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => { throw new Error('invalid json') },
      headers: new Headers(),
      redirected: false,
      statusText: 'Error',
      type: 'basic',
      url: '',
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      text: jest.fn(),
      bytes: jest.fn(),
    } as unknown as Response)

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'bad' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument()
    })

    expect(sessionStorage.getItem('loggedInUser')).toBeNull()
  })

  it('shows generic error message for non-200 non-401 responses', async () => {
    mockLoginUser.mockResolvedValue(
      createMockResponse(500, { message: 'oh no' })
    )

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'x' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'x' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/oh no/i)).toBeInTheDocument()
    })

    expect(sessionStorage.getItem('loggedInUser')).toBeNull()
  })

  it('shows connection error on request failure', async () => {
    mockLoginUser.mockRejectedValue(new Error('Network failure'))

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'tester' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/Unable to connect to server/i)).toBeInTheDocument()
    })

    expect(sessionStorage.getItem('loggedInUser')).toBeNull()
  })
})
