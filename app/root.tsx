import { HttpLink, split } from "@apollo/client/index.js";
import {
	ApolloClient,
	ApolloProvider,
	InMemoryCache,
} from "@apollo/client/index.js";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import type { LinksFunction } from "@remix-run/node";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import { createClient } from "graphql-ws";

import "./tailwind.css";

export const links: LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

const httpLink = new HttpLink({
	uri: "http://localhost:8080/graphql",
});

const wsLink = new GraphQLWsLink(
	createClient({
		url: "ws://localhost:8080/graphql",
	}),
);

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return (
			definition.kind === "OperationDefinition" &&
			definition.operation === "subscription"
		);
	},
	wsLink,
	httpLink,
);

const client = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache(),
});

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<ApolloProvider client={client}>
					{children}
					<ScrollRestoration />
					<Scripts />
				</ApolloProvider>
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function HydrateFallback() {
	return <p>Loading...</p>;
}
