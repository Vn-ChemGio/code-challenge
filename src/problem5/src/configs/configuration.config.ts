export interface DatabaseConfig {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
	sslMode?: boolean;
}

export const database_config = () => ({
	database: {
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT!, 10),
		username: process.env.DATABASE_URI,
		password: process.env.DATABASE_USER,
		database: process.env.DATABASE_NAME,
		sslMode: process.env.DATABASE_SSL_MODE,
	},
});
