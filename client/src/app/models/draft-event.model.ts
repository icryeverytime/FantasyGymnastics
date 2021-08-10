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