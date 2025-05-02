export function erDev(): boolean {
  return process.env.NEXT_PUBLIC_RUNTIME_ENVIRONMENT === "local";
}

enum RequestMethod {
  GET = "GET",
  POST = "POST",
}

const getHeaders = (): Headers => {
  const headersRecord: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
  };
  return new Headers(headersRecord);
};

export const serverRequest = (
  method: string,
  urlPath: string,
  body: string | null,
) => {
  const OPTIONS: RequestInit = {
    credentials: "include",
    headers: getHeaders(),
    method,
    body: body ? body : null,
  };

  return new Promise((resolve, reject) => {
    fetch(urlPath, OPTIONS)
      .then((response: Response) => {
        sjekkStatuskode(response);
        const jsonResponse = toJson(response);
        resolve(jsonResponse);
      })
      .catch((reason: Error) => reject(reason));
  });
};

export function toJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return response.text() as Promise<T>;
  }
  return response.json();
}

function sjekkStatuskode(response: Response) {
  if (response.status === 401) {
    console.warn("Bruker er ikke logget inn.");
    return response;
  }
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  throw new Error(response.statusText);
}

export function fetchPost(urlPath: string, body: string) {
  return serverRequest(RequestMethod.POST, urlPath, body);
}
