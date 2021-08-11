export enum DraftEventType {
    USER_JOINED,
    USER_LEFT,
    GYMNAST_DRAFTED,
    DRAFT_COMPLETE
};

export interface DraftEvent {
    type: DraftEventType,
    data: any
}

export interface UserJoinedDraftEvent extends DraftEvent {
    type: DraftEventType.USER_JOINED;
    data: {
        userEmail: string
    }
}

export interface UserLeftDraftEvent extends DraftEvent {
    type: DraftEventType.USER_LEFT;
    data: {
        userEmail: string
    }
}

export interface GymnastDraftedEvent extends DraftEvent {
    type: DraftEventType.GYMNAST_DRAFTED;
    data: {
        gymnastID: string
        name: string,
    }
}

export interface DraftCompleteEvent extends DraftEvent {
    type: DraftEventType.DRAFT_COMPLETE;
}