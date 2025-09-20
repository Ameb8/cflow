import { useAuth } from '../context/AuthContext';

const GitHubLogin = () => {
    const { handleGitHubLogin } = useAuth();

    return (
        <button onClick={handleGitHubLogin}>
            Login with GitHub
        </button>
    );
};

export default GitHubLogin;
