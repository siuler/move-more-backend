export type RegisterPayload = {
	username: string;
	email: string;
	password: string;
};

export type LoginPayload = {
	usernameOrEmail: string;
	password: string;
};