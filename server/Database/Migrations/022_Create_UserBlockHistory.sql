CREATE TABLE UserBlockHistory (
    Id              UNIQUEIDENTIFIER    NOT NULL PRIMARY KEY DEFAULT NEWID(),
    UserId          UNIQUEIDENTIFIER    NOT NULL REFERENCES Users(Id),
    AdminId         UNIQUEIDENTIFIER    NOT NULL REFERENCES Users(Id),
    Reason          NVARCHAR(500)       NOT NULL,
    BlockedUntilUtc DATETIME2           NULL,   -- NULL = permanent block
    CreatedAtUtc    DATETIME2           NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_UserBlockHistory_UserId ON UserBlockHistory(UserId);