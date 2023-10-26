export interface PaperBuildsAPI {
  project_id: string;
  project_name: string;
  version: string;
  builds: PaperBuild[];
}

interface PaperBuild {
  build: number;
  time: string;
  channel: string;
  promoted: boolean;
  changes: {
    commit: string;
    summary: string;
    message: string;
  }[];
  downloads: {
    application: {
      name: string;
      sha256: string;
    };
  };
}

export interface PurpurBuildsAPI {
  project: string;
  version: string;
  builds: {
    lastest: string;
    all: string[];
  };
}