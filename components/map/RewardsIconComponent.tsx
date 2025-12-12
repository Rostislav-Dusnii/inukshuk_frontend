import { PartyPopper } from 'lucide-react';

type Props = {
    setModalOpen: (bool: boolean) => void;
}

const RewardsIconComponent: React.FC<Props> = ({ setModalOpen }: Props) => {
    return (
        <div
            className="fixed bottom-5 left-5 w-[60px] h-[60px] rounded-full bg-white border-4 border-brand-orange flex items-center justify-center shadow-xl cursor-pointer z-[1000] hover:scale-110 active:scale-95 transition-transform hover:shadow-2xl"
            title="View Rewards"
            onClick={() => setModalOpen(true)}
        >
            <PartyPopper size={30} color="#ED760E" />
        </div>
    )
}

export default RewardsIconComponent