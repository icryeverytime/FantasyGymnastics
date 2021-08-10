export interface Alert {
    text: string;
    showAccept: boolean;
    showDecline: boolean;
    onAccept: () => void;
    onDecline: () => void;
}