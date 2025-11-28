import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'firebasestorage.googleapis.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '*.googleusercontent.com', // 先頭に *. をつけると lh3, lh4 等を網羅できます
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
