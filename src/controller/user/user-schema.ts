export const REGISTER_SCHEMA = {
	body: {
		type: 'object',
		required: ['email', 'username', 'password'],
		properties: {
			email: { type: 'string' },
			username: { type: 'string' },
			password: { type: 'string' },
		}
	}
};

export const LOGIN_SCHEMA = {
	body: {
		type: 'object',
		required: ['usernameOrEmail', 'password'],
		properties: {
			emailOrUsername: { type: 'string' },
			password: { type: 'string' },
		}
	}
}