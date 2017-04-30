'use strict'

module.exports = function (params, config, repos) {
  var language = params.language.toLowerCase()
  var reposWithLanguage = [];
  if (repos && repos.feed && repos.feed.filter){
    reposWithLanguage = repos.feed.repos.filter(function (repo) {
      if (!repo.language) {
        return false
      }
      return repo.language.toLowerCase() === language
    })
  }
  
  return {
    meta: {
      generated_at: new Date().toISOString(),
      location: config.city,
      total_repos: repos.length,
      api_version: config.api_version,
      max_repos: reposWithLanguage.length
    },
    repos: reposWithLanguage
  }
}
