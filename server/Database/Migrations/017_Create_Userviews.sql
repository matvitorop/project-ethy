CREATE TABLE UserReviews (
    Id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_UserReviews PRIMARY KEY,
    HelpRequestId   UNIQUEIDENTIFIER NOT NULL REFERENCES HelpRequests(Id),
    ReviewerUserId  UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
    TargetUserId    UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
    IsPositive      BIT              NOT NULL,
    Comment         NVARCHAR(1000)   NULL,
    CreatedAtUtc    DATETIME2        NOT NULL,

    CONSTRAINT UQ_UserReviews_HelpRequest_Reviewer
        UNIQUE (HelpRequestId, ReviewerUserId)
);