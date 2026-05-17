using DbUp;
using GraphQL;
using GraphQL.Authorization;
using GraphQL.Types;
using GraphQL.Validation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using server.Application.Handlers.RegisterUser;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Application.Services;
using server.Domain;
using server.Infrastructure;
using server.Infrastructure.Authentication;
using server.Infrastructure.ImageStoring;
using server.Infrastructure.Repositories;
using server.Infrastructure.BackgroundServices;
using server.Presentation.Controllers;
using server.Presentation.GraphQL.Helpers;
using server.Presentation.GraphQL.Mutations;
using server.Presentation.GraphQL.Schemas;
using server.Presentation.Hubs;
using server.Presentation.Schemas;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Migrations
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

var upgrader =
    DeployChanges.To
        .SqlDatabase(connectionString)
        .WithScriptsFromFileSystem(Path.Combine(AppContext.BaseDirectory, "Database", "Migrations"))
        .LogToConsole()
        .Build();

var result = upgrader.PerformUpgrade();

if (!result.Successful)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine(result.Error);
    Console.ResetColor();
    throw new Exception("Database migration failed");
}



// DEPENDENCY INJECTION
builder.Services.AddTransient<AuthMutation>();
builder.Services.AddTransient<AppMutation>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
    });
});

// Configure Dapper

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

// =====================
// CACHE CONFIG
// =====================
builder.Services.AddMemoryCache();

// =====================
// JWT CONFIG
// =====================
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettings);

// connection factory registration
builder.Services.AddSingleton<ISqlConnectionFactory>(new SqlConnectionFactory(connectionString));

builder.Services.AddHostedService<TemporaryFileCleanupService>();
builder.Services.AddHostedService<OrphanedImagesCleanupService>();

// --- Email (SMTP) ---
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();

// --- New repositories ---
builder.Services.AddScoped<IEmailVerificationTokenRepository, EmailVerificationTokenRepository>();
builder.Services.AddScoped<IVolunteerApplicationRepository, VolunteerApplicationRepository>();
builder.Services.AddScoped<IBlockHistoryRepository, BlockHistoryRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// --- Admin seeder ---
builder.Services.AddHostedService<AdminSeeder>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IHelpRequestRepository, HelpRequestRepository>();
builder.Services.AddScoped<IChatRepository, ChatRepository>();
builder.Services.AddScoped<IStageRepository, StageRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IComplaintRepository, ComplaintRepository>();
builder.Services.AddScoped<IStatisticsRepository, StatisticsRepository>();
builder.Services.AddScoped<IPasswordHasher, Pbkdf2PasswordHasher>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<INotificationService, server.Infrastructure.Notifications.NotificationService>();
builder.Services.AddScoped<IImageStorageService, CloudinaryImageStorageService>();
builder.Services.AddSignalR();

// CONTROLLERS REGISTRATION
builder.Services.AddControllers()
    .AddApplicationPart(typeof(HelpRequestFilesController).Assembly);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["Key"]!)
            )
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("jwt", out var token))
                    context.Token = token;

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Verified", policy => 
        policy.RequireAuthenticatedUser().RequireClaim("email_verified", "true"));
});

// =====================
// GRAPHQL AUTHORIZATION
// =====================
builder.Services
    .AddSingleton<IAuthorizationEvaluator, AuthorizationEvaluator>()
    .AddSingleton(_ =>
    {
        var settings = new AuthorizationSettings();
        settings.AddPolicy("Authenticated", p => p.RequireAuthenticatedUser());
        settings.AddPolicy("Verified", p => 
            p.RequireAuthenticatedUser().RequireClaim("email_verified", "true"));

        //settings.AddPolicy("Admin", p =>
        //    p.RequireClaim(ClaimTypes.Role, UserRole.Admin.ToString()));

        return settings;
    })
    .AddTransient<IValidationRule, AuthorizationValidationRule>();

// =====================
// GRAPHQL
// =====================
builder.Services.AddScoped<ISchema, AppSchema>();
builder.Services.AddGraphQL(b => b
    .AddSystemTextJson()
    .AddGraphTypes()
    .AddSchema<AppSchema>()
    .AddAuthorizationRule()
    .AddUserContextBuilder(httpContext => new GraphQLUserContext
    {
        HttpContext = httpContext,
        User = httpContext.User
    })
    .ConfigureExecutionOptions(options =>
    {
        options.EnableMetrics = builder.Environment.IsDevelopment();
        options.ThrowOnUnhandledException = builder.Environment.IsDevelopment();
    }));

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<RegisterUserHandler>());


var app = builder.Build();

// =====================
// MIDDLEWARE ORDER
// =====================
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseRouting();

app.UseCors();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<server.Presentation.Middlewares.LastActivityMiddleware>();

// ROUTING TO CONTROLLERS
app.MapControllers();

// =====================
// GRAPHQL ENDPOINTS
// =====================
app.UseGraphQL<ISchema>("/graphql");
if (app.Environment.IsDevelopment())
{
    app.UseGraphQLGraphiQL("/graphql/ui");
}

// =====================
// Chat endpoint for SignalR
// =====================
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
public partial class Program { }
