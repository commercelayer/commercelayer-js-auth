module.exports = {
  reject: [
    'pnpm'
  ],
  filterResults: (name, { upgradedVersionSemver }) => {
    if (
      name === '@types/node' && Number.parseInt(upgradedVersionSemver?.major) >= 22
    ) {
      return false
    }

    return true
  }
}
