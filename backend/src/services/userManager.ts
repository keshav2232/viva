import { User } from '../models/User';

export const saveUser = async (name: string, email: string) => {
    try {
        let user = await User.findOne({ email });
        if (user) {
            return user;
        }

        user = await User.create({
            name,
            email,
            createdAt: Date.now()
        });
        return user;
    } catch (error) {
        console.error("Error saving user:", error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        return await User.find().sort({ createdAt: -1 });
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};
