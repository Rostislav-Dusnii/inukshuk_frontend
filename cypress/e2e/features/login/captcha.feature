Feature: Captcha
    Background:
        Given I am on the "login" page

    Scenario: reCAPTCHA notice is visible on login
        Then I see text 'Protected by reCAPTCHA v3'
