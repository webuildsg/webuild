(function() {
  var updateBtn = document.getElementById('update')

  if (!updateBtn) {
    return
  }

  updateBtn.addEventListener('click', function() {
    updateBtn.disabled = true

    var selectedGroups = document.querySelectorAll('input[type="radio"]:checked')
    var answer = {}

    selectedGroups.forEach(function(eachGroup){
      if (eachGroup.value === "yes") {
        if (!answer.whitelistGroups) {
          answer.whitelistGroups = []
        }

        answer.whitelistGroups.push({
          group_id: eachGroup.name,
          group_name: eachGroup.dataset.name,
          group_url: eachGroup.dataset.url
        })
      } else {
        if (!answer[ eachGroup.dataset.platform ]) {
          answer[ eachGroup.dataset.platform ] = []
        }

        answer[ eachGroup.dataset.platform ].push(eachGroup.name)
      }
    })

    console.log(answer)
  })
})()
