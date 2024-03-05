import "dotenv/config";
import { userResponseDB } from "../@types/DBresponses";
import { UserRepository } from "../repositories/userRepository";
import { ApiError } from "../utils/ApiError";
import { hashString } from "../utils/hashString";
import { generateJwtToken } from "../utils/generateJwtToken";
import bcrypt from "bcrypt";

export class AuthService {
  constructor(private userRepository = new UserRepository()) {}

  async signUp(
    name: string,
    username: string,
    email: string,
    password: string
  ): Promise<{ userId: string; token: string }> {
    const hashPassword = await hashString(password, 10);

    const user: userResponseDB = await this.userRepository
      .create(name, username, email, hashPassword)
      .catch((error: any) => {
        if (error.keyValue) {
          if (error.keyValue.name)
            throw new ApiError("this name already exists", 400);

          if (error.keyValue.username)
            throw new ApiError("this username already exists", 400);

          if (error.keyValue.email)
            throw new ApiError("this email already exists", 400);
        }
        throw error;
      });

    if (!user) 
      throw new ApiError("failure to create user", 500);
    

    const token = generateJwtToken(user?._id as string);

    return {
      userId: user?._id as string,
      token: token
    };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ userId: string; token: string }> {
    const user: userResponseDB =
      await this.userRepository.findByEmailWithPassword(email);

    if (!user) 
      throw new ApiError("wrong email or password", 401);

    const isPasswordValid: boolean = bcrypt.compareSync(
      password,
      user?.password as string
    );

    if (!isPasswordValid) throw new ApiError("wrong email or password", 401);

    const token = generateJwtToken(user?._id as string);

    return {
      userId: user?._id as string,
      token: token
    };
  }
}
