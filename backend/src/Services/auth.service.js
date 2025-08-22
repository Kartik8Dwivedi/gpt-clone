import UserRepository from "../Repository/user.repository.js";

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async syncUser(clerkUser) {
    const existingUser = await this.userRepository.findByClerkId(clerkUser.id);

    if (existingUser) {
      const updatedUser = await this.userRepository.upsert(
        { clerkId: clerkUser.id },
        {
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName} ${clerkUser.lastName}`,
          avatar: clerkUser.imageUrl,
        }
      );
      return { data: updatedUser, message: "User updated successfully" };
    }

    const newUser = await this.userRepository.create({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      avatar: clerkUser.imageUrl,
    });

    return { data: newUser, message: "User created successfully" };
  }

  async getUserProfile(clerkId) {
    const user = await this.userRepository.findOne({ clerkId });
    if (!user) {
      throw new Error("User not found");
    }
    return { data: user, message: "User profile fetched successfully" };
  }
}

export default AuthService;
