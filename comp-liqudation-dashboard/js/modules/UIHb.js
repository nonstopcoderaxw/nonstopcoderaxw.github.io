async function createTemplateComponents(){
    const navHtml = await createHBhtml({}, "./views/hb_nav.html");

    $("#tNav").html(navHtml);
}

async function createHBhtml(data, url){
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
      return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
    });

    var template = await $.get(url);
    var theTemplate = Handlebars.compile(template);
    var theCompiledHtml = theTemplate(data);

    return theCompiledHtml;
}

export{
    createTemplateComponents,
    createHBhtml
}
