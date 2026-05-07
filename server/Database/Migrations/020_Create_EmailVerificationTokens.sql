CREATE TABLE EmailVerificationTokens (
    Id              UNIQUEIDENTIFIER    NOT NULL PRIMARY KEY DEFAULT NEWID(),
    UserId          UNIQUEIDENTIFIER    NOT NULL REFERENCES Users(Id),
    Token           NVARCHAR(200)       NOT NULL,
    ExpiresAtUtc    DATETIME2           NOT NULL,
    IsUsed          BIT                 NOT NULL DEFAULT 0,
    CreatedAtUtc    DATETIME2           NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_EmailVerificationTokens_Token  ON EmailVerificationTokens(Token);
CREATE INDEX IX_EmailVerificationTokens_UserId ON EmailVerificationTokens(UserId);
