module.exports = async ({core}) => {
  const {PARSED_ISSUE} = process.env
  const issue = JSON.parse(PARSED_ISSUE)
  core.debug(issue)
}
