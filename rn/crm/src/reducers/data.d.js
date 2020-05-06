export interface IUserRegister {
    id?: number;
    name?: string;
    nickname?: string;
    email?: string;
    wechat_openid?: string;
    has_password?: boolean;
    avatar?: string;
    gender?: 'male' | 'famale';
    bio?: string;
    settings?: {
        comment_email_notify?: boolean;
        like_email_notify?: boolean;
    };
    extends?: {
        country?: string;
        province?: string;
        city?: string;
        geographic?: object;
    };
    cache?: {
        unread_count?: number;
        articles_count?: number;
        comments_count?: number;
    };
    created_at?: string;
    updated_at?: string;
}

