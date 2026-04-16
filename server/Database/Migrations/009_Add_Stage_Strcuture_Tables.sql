CREATE TABLE HelpRequestStages (
    Id               UNIQUEIDENTIFIER PRIMARY KEY,
    HelpRequestId    UNIQUEIDENTIFIER NOT NULL REFERENCES HelpRequests(Id),
    ChatId           UNIQUEIDENTIFIER NOT NULL REFERENCES Chats(Id),
    ProposedByUserId UNIQUEIDENTIFIER NOT NULL,
    Content          NVARCHAR(500) NOT NULL,
    Status           INT NOT NULL,
    RejectionReason  NVARCHAR(500) NULL,
    CreatedAtUtc     DATETIME2 NOT NULL,
    ResolvedAtUtc    DATETIME2 NULL
);

CREATE TABLE HelpRequestEventLog (
    Id            UNIQUEIDENTIFIER PRIMARY KEY,
    HelpRequestId UNIQUEIDENTIFIER NOT NULL REFERENCES HelpRequests(Id),
    ActorId       UNIQUEIDENTIFIER NOT NULL,
    EventType     INT NOT NULL,
    Payload       NVARCHAR(MAX) NOT NULL,
    CreatedAtUtc  DATETIME2 NOT NULL
);

CREATE TABLE StageTemplates (
    Id          UNIQUEIDENTIFIER PRIMARY KEY,
    Content     NVARCHAR(500) NOT NULL,
    IsAutomatic BIT NOT NULL DEFAULT 0
);

INSERT INTO StageTemplates (Id, Content, IsAutomatic) VALUES
    (NEWID(), N'Executive assigned', 1),
    (NEWID(), N'Details of cooperation agreed', 0),
    (NEWID(), N'Assistance provided', 0),
    (NEWID(), N'Confirmation received', 0),
    (NEWID(), N'Cooperation completed', 1);