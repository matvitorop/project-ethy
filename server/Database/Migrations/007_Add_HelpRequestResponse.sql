CREATE TABLE HelpRequestResponses
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    HelpRequestId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Status INT NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    CreatedAtUtc DATETIME2 NOT NULL,

    CONSTRAINT FK_HelpRequestResponses_HelpRequests
        FOREIGN KEY (HelpRequestId) REFERENCES HelpRequests(Id),

    CONSTRAINT UQ_HelpRequestResponses_User
        UNIQUE (HelpRequestId, UserId)
);

ALTER TABLE HelpRequests
ADD AssignedUserId UNIQUEIDENTIFIER NULL;