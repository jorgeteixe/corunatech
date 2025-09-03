export default async ({core}) => {
  const {PARSED_ISSUE} = process.env
  const issue = JSON.parse(PARSED_ISSUE)
  core.info(JSON.stringify(issue, null, 2))
}
