ALTER TABLE Users
    ADD PhoneNumber     NVARCHAR(20)  NULL,
        SocialLinks     NVARCHAR(500) NULL,
        IsEmailVerified BIT           NOT NULL DEFAULT 0;