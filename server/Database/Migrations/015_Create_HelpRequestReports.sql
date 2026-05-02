CREATE TABLE HelpRequestReports (
    Id              UNIQUEIDENTIFIER PRIMARY KEY,
    HelpRequestId   UNIQUEIDENTIFIER NOT NULL REFERENCES HelpRequests(Id),
    CreatedByUserId UNIQUEIDENTIFIER NOT NULL,
    Comment         NVARCHAR(2000) NOT NULL,
    ImageUrl        NVARCHAR(500) NULL,
    CreatedAtUtc    DATETIME2 NOT NULL
);