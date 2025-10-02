namespace GoogleMeetCloneNET.Features;

public record RegisterUserByEmailCommand(string Email, string Password, string FullName) : IRequest<Unit>;


public class RegisterUserByEmailCommandValidator
    : AbstractValidator<RegisterUserByEmailCommand>
{
    public RegisterUserByEmailCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email must not be empty")
            .EmailAddress().WithMessage("Invalid email address");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password must not be empty")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name must not be empty")
            .MaximumLength(50).WithMessage("Full name must not exceed 50 characters");
    }
}

public sealed class RegisterUserByEmailCommandHandler
  : IRequestHandler<RegisterUserByEmailCommand, Unit>
{
    private readonly AppDbContext _context;

    public RegisterUserByEmailCommandHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(RegisterUserByEmailCommand command, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Id = ObjectId.GenerateNewId().ToString(),
            Email = "vietvyqw@gmail.com",
            FullName = "Viet Vy",
            PasswordHash = "123456",
            AvatarUrl = "https://avatars.githubusercontent.com/u/16882359?v=4",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow

        };
        await _context.Users.InsertOneAsync(user);
        return Unit.Value;
    }
}