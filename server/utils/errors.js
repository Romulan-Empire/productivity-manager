// TODO: Rename to withCatchAndLog and have a second param for the variables to log if in production
const withCatch = async (fn, ...logVars) => {
  try {
    return await fn();
  } catch(e) {
    // sentry log if in prod?
    console.error('error', e, ...logVars);
  }
};

exports.withCatch = withCatch;