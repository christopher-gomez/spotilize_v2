
import {
	createBrowserRouter,
} from "react-router-dom";
import CloudPlayer from "./PlayerView/index.tsx";
import AuthSuccess from "./PlayerView/AuthSuccess.tsx";

export default createBrowserRouter([
	{
		path: "/",
		element: <CloudPlayer />
	},
	// {
	// 	path: "/catan",
	// 	element: <Catan />
	// },
	// {
	// 	path: '/docs',
	// 	element: <Docs />

	// },
	// {
	// 	path: '/test',
	// 	element: <Test />
	// },
	// {
	// 	path: '/cards',
	// 	element: <CardView />
	// },
	// {
	// 	path: '/cloudShooter',
	// 	element: <SceneView />
	// },
	// {
	// 	path: '/cloudPlayer',
	// 	element: <CloudPlayer />
	// },
	{
		path: '/spotifyAuthSuccess',
		element: <AuthSuccess />
	}
]);