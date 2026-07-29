/**
 * Shared GitHub source configuration for both pipelines.
 *
 * Auth uses a CodeConnections (GitHub App) connection rather than a personal
 * access token. The previous setup stored a classic PAT in the `gh-token`
 * Secrets Manager secret; classic PATs expire, and when that one lapsed both
 * pipelines failed at their Source stage. A CodeConnections connection does not
 * expire, and the V1 GitHub OAuth source action it replaces is deprecated.
 *
 * The connection is created once, out of band, and authorized in the AWS
 * console (Developer Tools > Settings > Connections). It must be in `AVAILABLE`
 * state and the GitHub App installation must grant access to REPO below.
 */
export const GITHUB_OWNER = 'hpfs74';
export const GITHUB_REPO = 'personal-website';
export const GITHUB_BRANCH = 'main';

export const GITHUB_REPO_ID = `${GITHUB_OWNER}/${GITHUB_REPO}`;

export const CODESTAR_CONNECTION_ARN =
  'arn:aws:codeconnections:eu-south-1:495133941005:connection/573b5341-5aa0-4a20-9294-87752d831c1a';
