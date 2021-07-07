export interface Alert {
    text: string;
    onAccept: () => void;
    onDismiss: () => void;
}