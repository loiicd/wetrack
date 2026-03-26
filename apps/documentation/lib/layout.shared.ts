import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const gitConfig = {
  user: "loiicd",
  repo: "wetrack",
  branch: "main",
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "WeTrack Docs",
      url: "https://docs.wetrack.dev",
    },
    githubUrl: `https://github.com/${gitConfig.user}/wetrack-dashboard`,
    links: [
      {
        text: "App",
        url: "https://app.wetrack.dev",
        active: "none",
      },
    ],
  };
}
