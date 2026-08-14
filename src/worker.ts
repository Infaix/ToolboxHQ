const worker = {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathName = url.pathname === "/" ? "/index.html" : url.pathname;

    try {
      const response = await fetch(`out${pathName}`);
      const html = await response.text();
      return new Response(html, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  },
};

export default worker;
