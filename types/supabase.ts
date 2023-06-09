/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/": {
    get: {
      responses: {
        /** OK */
        200: unknown;
      };
    };
  };
  "/profile": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.profile.id"];
          username?: parameters["rowFilter.profile.username"];
          created_at?: parameters["rowFilter.profile.created_at"];
          about?: parameters["rowFilter.profile.about"];
          avatar_url?: parameters["rowFilter.profile.avatar_url"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["profile"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** profile */
          profile?: definitions["profile"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.profile.id"];
          username?: parameters["rowFilter.profile.username"];
          created_at?: parameters["rowFilter.profile.created_at"];
          about?: parameters["rowFilter.profile.about"];
          avatar_url?: parameters["rowFilter.profile.avatar_url"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.profile.id"];
          username?: parameters["rowFilter.profile.username"];
          created_at?: parameters["rowFilter.profile.created_at"];
          about?: parameters["rowFilter.profile.about"];
          avatar_url?: parameters["rowFilter.profile.avatar_url"];
        };
        body: {
          /** profile */
          profile?: definitions["profile"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/shader": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.shader.id"];
          created_at?: parameters["rowFilter.shader.created_at"];
          name?: parameters["rowFilter.shader.name"];
          description?: parameters["rowFilter.shader.description"];
          license?: parameters["rowFilter.shader.license"];
          body?: parameters["rowFilter.shader.body"];
          author?: parameters["rowFilter.shader.author"];
          visibility?: parameters["rowFilter.shader.visibility"];
          thumb_url?: parameters["rowFilter.shader.thumb_url"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["shader"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** shader */
          shader?: definitions["shader"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.shader.id"];
          created_at?: parameters["rowFilter.shader.created_at"];
          name?: parameters["rowFilter.shader.name"];
          description?: parameters["rowFilter.shader.description"];
          license?: parameters["rowFilter.shader.license"];
          body?: parameters["rowFilter.shader.body"];
          author?: parameters["rowFilter.shader.author"];
          visibility?: parameters["rowFilter.shader.visibility"];
          thumb_url?: parameters["rowFilter.shader.thumb_url"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.shader.id"];
          created_at?: parameters["rowFilter.shader.created_at"];
          name?: parameters["rowFilter.shader.name"];
          description?: parameters["rowFilter.shader.description"];
          license?: parameters["rowFilter.shader.license"];
          body?: parameters["rowFilter.shader.body"];
          author?: parameters["rowFilter.shader.author"];
          visibility?: parameters["rowFilter.shader.visibility"];
          thumb_url?: parameters["rowFilter.shader.thumb_url"];
        };
        body: {
          /** shader */
          shader?: definitions["shader"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
}

export interface definitions {
  profile: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     */
    id: string;
    /** Format: character varying */
    username?: string;
    /**
     * Format: timestamp with time zone
     * @default now()
     */
    created_at?: string;
    /** Format: character varying */
    about?: string;
    /** Format: character varying */
    avatar_url?: string;
  };
  shader: {
    /**
     * Format: bigint
     * @description Note:
     * This is a Primary Key.<pk/>
     */
    id: number;
    /**
     * Format: timestamp with time zone
     * @default now()
     */
    created_at: string;
    /** Format: character varying */
    name: string;
    /** Format: character varying */
    description?: string;
    /** Format: text */
    license?: string;
    /** Format: jsonb */
    body: string;
    /** Format: uuid */
    author: string;
    /**
     * Format: public.visibility
     * @default private
     * @enum {string}
     */
    visibility: "private" | "unlisted" | "public";
    /** Format: character varying */
    thumb_url?: string;
  };
}

export interface parameters {
  /**
   * @description Preference
   * @enum {string}
   */
  preferParams: "params=single-object";
  /**
   * @description Preference
   * @enum {string}
   */
  preferReturn: "return=representation" | "return=minimal" | "return=none";
  /**
   * @description Preference
   * @enum {string}
   */
  preferCount: "count=none";
  /** @description Filtering Columns */
  select: string;
  /** @description On Conflict */
  on_conflict: string;
  /** @description Ordering */
  order: string;
  /** @description Limiting and Pagination */
  range: string;
  /**
   * @description Limiting and Pagination
   * @default items
   */
  rangeUnit: string;
  /** @description Limiting and Pagination */
  offset: string;
  /** @description Limiting and Pagination */
  limit: string;
  /** @description profile */
  "body.profile": definitions["profile"];
  /** Format: uuid */
  "rowFilter.profile.id": string;
  /** Format: character varying */
  "rowFilter.profile.username": string;
  /** Format: timestamp with time zone */
  "rowFilter.profile.created_at": string;
  /** Format: character varying */
  "rowFilter.profile.about": string;
  /** Format: character varying */
  "rowFilter.profile.avatar_url": string;
  /** @description shader */
  "body.shader": definitions["shader"];
  /** Format: bigint */
  "rowFilter.shader.id": string;
  /** Format: timestamp with time zone */
  "rowFilter.shader.created_at": string;
  /** Format: character varying */
  "rowFilter.shader.name": string;
  /** Format: character varying */
  "rowFilter.shader.description": string;
  /** Format: text */
  "rowFilter.shader.license": string;
  /** Format: jsonb */
  "rowFilter.shader.body": string;
  /** Format: uuid */
  "rowFilter.shader.author": string;
  /** Format: public.visibility */
  "rowFilter.shader.visibility": string;
  /** Format: character varying */
  "rowFilter.shader.thumb_url": string;
}

export interface operations {}

export interface external {}
