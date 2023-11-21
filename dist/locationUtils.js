export const getLocationPars = history => {
  return new URLSearchParams(window.location.search);
};
export const updateLocationsPars = (history, pars, deletePrefix) => {
  let location = history.location;
  let changeLocation = history.push;
  const currentLocationPars = new URLSearchParams(location.search);
  let updated = false;
  for (let kv of Object.entries(pars)) {
    let key = kv[0];
    let value = kv[1];
    let currentLocationValue = currentLocationPars.get(key);
    // eslint-disable-next-line
    if (value != currentLocationValue) {
      updated = true;
      if (!value) currentLocationPars.delete(key);else currentLocationPars.set(key, value);
    }
  }
  if (updated) {
    const parsStr = currentLocationPars.toString();
    changeLocation(`${location.pathname.endsWith('/') ? location.pathname : `${location.pathname}/`}${parsStr ? "?" : ""}${parsStr}`);
  }
};