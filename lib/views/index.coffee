doctype 5
html ->
    head ->
        meta charset: 'utf-8'
        title "#{if @title then @title+' - ' else ''}Concrete"
        meta(name: 'description', content: @desc) if @desc?
        link rel: 'stylesheet', href: 'stylesheets/app.css'
        script src: 'js/jquery-1.6.2.min.js'
        script src: 'js/coffeekup.js'
        script src: 'js/moment.min.js'
        script src: 'concrete.js'

    body ->
        header ->
            hgroup ->
                h1 'CONCRETE'
                h2 '.project', -> @project
                nav ->
                    a href: '/', class: 'active', 'Builds'
                    a href: '/stats', 'Stats'
                    form method: 'post', action: '/', ->
                        button '.build', -> 'Build'

        div '#content', ->
            ul '.jobs', ->
                if @jobs.length is 0
                    li '.nojob', -> 'No jobs have been submitted.'
                for i in [@jobs.length - 1..0] by -1
                    @job = @jobs[i]
                    partial 'jobPartial'

