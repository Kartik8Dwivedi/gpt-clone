import UserRepository from '../repositories/user.repository'; // Import the UserRepository
import { IUser } from '../models/user.model'; // Import the User interface

// Define a type for the Clerk user object, based on its usage in syncUser
interface ClerkUser {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async syncUser(clerkUser: ClerkUser): Promise<{ data: IUser; message: string }> {
    const existingUser = await this.userRepository.findByClerkId(clerkUser.id);

    if (existingUser) {
      const updatedUser = await this.userRepository.upsert(
        { clerkId: clerkUser.id },
        {
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          avatar: clerkUser.imageUrl,
        }
      );
      if (!updatedUser) {
        throw new Error("Failed to update user.");
      }
      return { data: updatedUser, message: "User updated successfully" };
    }

    const newUser = await this.userRepository.create({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      avatar: clerkUser.imageUrl,
    });

    if (!newUser) {
      throw new Error("Failed to create user.");
    }
    return { data: newUser, message: "User created successfully" };
  }

  async getUserProfile(clerkId: string): Promise<{ data: IUser; message: string }> {
    const user = await this.userRepository.findOne({ clerkId });
    if (!user) {
      throw new Error("User not found");
    }
    return { data: user, message: "User profile fetched successfully" };
  }
}

export default AuthService;
