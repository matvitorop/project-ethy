CREATE TABLE HelpRequestImages (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    HelpRequestId UNIQUEIDENTIFIER NOT NULL,

    [Order] INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,

    CONSTRAINT FK_HelpRequestImages_HelpRequests
        FOREIGN KEY (HelpRequestId) REFERENCES HelpRequests(Id)
        ON DELETE CASCADE
);