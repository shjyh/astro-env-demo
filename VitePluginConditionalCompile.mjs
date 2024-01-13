import { defineDirective, Context } from 'unplugin-preprocessor-directives';

function resolveConditional(test, env = process.env) {
  test = test || "true";
  test = test.trim();
  test = test.replace(/([^=!])=([^=])/g, "$1==$2");
  const evaluateCondition = new Function("env", `with (env){ return ( ${test} ) }`);
  try {
    return evaluateCondition(env);
  } catch (error) {
    if (error instanceof ReferenceError) {
      const match = /(\w*?) is not defined/g.exec(error.message);
      if (match && match[1]) {
        const name = match[1];
        env[name] = false;
        return resolveConditional(test, env);
      }
    }
    return false;
  }
}
const vIfDefine = defineDirective(() => ({
  name: "#v-ifdef",
  nested: true,
  pattern: {
    start: /.*?#v-ifdef\s([\w !=&|()'"]*).*[\r\n]{1,2}/gm,
    end: /\s*.*?#v-endif.*?$/gm
  },
  processor({ matchGroup, replace, ctx }) {
    const code = replace(matchGroup.match);
    const regex = /.*?(#v-el(?:if|se))\s?([\w !=&|()'"]*).*[\r\n]{1,2}/gm;
    const codeBlock = [
      "#v-ifdef",
      matchGroup.left?.[1] || "",
      ...ctx.XRegExp.split(code, regex)
    ].map((v) => v.trim());
    while (codeBlock.length) {
      const [variant, conditional, block] = codeBlock.splice(0, 3);
      if (variant === "#v-ifdef" || variant === "#v-elif") {
        if (resolveConditional(conditional, ctx.env))
          return block;
      } else if (variant === "#v-else") {
        return block;
      }
    }
    return "";
  }
}));
const resolveOptions = (userOptions) => {
  return {
    include: ["**/*"],
    exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
    ...userOptions,
    directives: [
      vIfDefine()
    ]
  };
};

function createContext(options = {}) {
  return new Context(resolveOptions(options));
}

const VitePluginConditionalCompile = (userOptions = {}) => {
  const ctx = createContext(userOptions);
  return {
    name: "vite-plugin-conditional-compile",
    enforce: "pre",
    configResolved(config) {
      ctx.env = { ...ctx.env, ...config.env };
    },
    transform: (code, id, opt) => {
      if(opt) {
        ctx.env.SSR = opt.ssr;
      } else {
        delete ctx.env.SSR;
      }
      return ctx.transform(code, id)
    }
  };
};

export { VitePluginConditionalCompile as default };
