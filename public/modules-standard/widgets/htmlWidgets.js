app.service('htmlWidgets' , function () {


    this.getJumbotronHTML = function ()
    {

                return '<div page-block class="jumbotron" ndType="jumbotron">'+
                        '<h1 page-block  class="editable" ndType="header" contenteditable="false">  Hello, world! </h1>'+
                        '<p page-block  class="editable" contenteditable="false" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        /*'<a page-block  class="editable btn btn-default" ndType="button"  role="button">My button</a>'+*/
                        '</div>';
    }

    this.get4colsctaHTML = function()
    {
                return '<div page-block class="container-fluid ndContainer" ndType="container">'+
                    '<div  page-block class="col-md-3 ndContainer" ndType="column" >'+
                        '<h3  page-block class="editable" ndType="header" >  A header text H3 </h3>'+
                        '<p page-block class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        '<div page-block class="Block500" ndType="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'+
                    '</div>'+
                    '<div class="col-md-3 ndContainer" ndType="column">'+
                        '<h3 page-block  class="editable"  ndType="header" >  A header text H3 </h3>'+
                        '<p page-block  class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        '<div page-block class="Block500" ndType="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'+
                    '</div>'+
                    '<div class="col-md-3 ndContainer" ndType="column" >'+
                        '<h3  page-block  class="editable" ndType="header" >  A header text H3 </h3>'+
                        '<p page-block  class="editable"  ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        '<div page-block class="Block500" ndType="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'+
                    '</div>'+
                    '<div class="col-md-3 ndContainer" ndType="column">'+
                        '<h3  page-block  class="editable" ndType="header" >  A header text H3 </h3>'+
                        '<p page-block  class="editable"  ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        '<div page-block class="Block500" ndType="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'+
                    '</div>'+
                '</div>';
    }

    this.get3colsctaHTML = function()
    {
                return '<div page-block class="container-fluid ndContainer" ndType="container">'+
                    '<div  page-block class="col-md-4 ndContainer" ndType="column" >'+
                        '<h3  page-block class="editable" ndType="header" >  A header text H3 </h3>'+
                        '<p page-block class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        '<div page-block class="Block500" ndType="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'+
                    '</div>'+
                    '<div class="col-md-4 ndContainer" ndType="column">'+
                        '<h3 page-block  class="editable"  ndType="header" >  A header text H3 </h3>'+
                        '<p page-block  class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        '<div page-block class="Block500" ndType="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'+
                    '</div>'+
                    '<div class="col-md-4 ndContainer" ndType="column">'+
                        '<h3  page-block  class="editable" ndType="header" >  A header text H3 </h3>'+
                        '<p page-block  class="editable"  ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        '<div page-block class="Block500" ndType="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'+
                    '</div>'+
                '</div>';

    }

    this.get2colsctaHTML = function()
    {
                return '<div page-block class="container-fluid ndContainer" ndType="container">'+
                    '<div  page-block class="col-md-6 ndContainer" ndType="column" >'+
                        '<h3  page-block class="editable" ndType="header" >  A header text H3 </h3>'+
                        '<p page-block class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        '<div page-block class="Block500" ndType="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'+
                    '</div>'+
                    '<div class="col-md-6 ndContainer" ndType="column">'+
                        '<h3 page-block  class="editable"  ndType="header" >  A header text H3 </h3>'+
                        '<p page-block  class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        '<div page-block class="Block500" ndType="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'+
                    '</div>'+
                '</div>';

    }

    this.getImageTextLargeHTML = function()
    {
                return  '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >'+
                            '<div page-block class="col-md-7 col-md-push-5 ndContainer" ndType="column"  ndType="col" >'+
                                '<h2 page-block class="editable featurette-heading"  ndType="header" contenteditable="false">Oh yeah, it is that good. <span class="text-muted">See for yourself.</span></h2>'+
                                '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>'+
                            '</div>'+
                            '<div page-block class="col-md-5 col-md-pull-7 ndContainer" ndType="column">'+
                                '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'
                            '</div>'+
                        '</div>';

    }

    this.getTextImageLargeHTML = function()
    {
                return  '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >'+
                            '<div page-block class="col-md-7 ndContainer" ndType="column"  ndType="col" >'+
                                '<h2 page-block class="editable featurette-heading"  ndType="header" contenteditable="false">Oh yeah, it is that good. <span class="text-muted">See for yourself.</span></h2>'+
                                '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>'+
                            '</div>'+
                            '<div page-block class="col-md-5 ndContainer" ndType="column">'+
                                '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'
                            '</div>'+
                        '</div>';

    }

    this.getTextLargeHTML = function()
    {
                return  '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >'+
                                '<h2 page-block class="editable featurette-heading"  ndType="header" contenteditable="false">Oh yeah, it is that good. <span class="text-muted">See for yourself.</span></h2>'+
                                '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>'+
                                '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'
                                '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>'+
                        '</div>';

    }

    this.getTabsHTML = function(id,tabs)
    {

        var theHTML =  '<div page-block id="'+id+'" class="container-fluid ndContainer"  ndType="tabsContainer" >'+
                            '<div  class="nav-tabs-justified ng-isolate-scope">'+
                                '<ul id="'+id+'_HEADER" class="nav nav-tabs" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}">';
                for (var t in tabs)
                        {
                            theHTML += '<li id="'+tabs[t].id+'_HEADER" heading="Home" class="ng-isolate-scope" >'+
                                        '<a page-block id="'+tabs[t].id+'_LABEL" ng-click="selectThisTab(\''+id+'\',\''+tabs[t].id+'\')"  class="editable">'+tabs[t].label+'</a>'+
                                    '</li>';
                        }


            theHTML +=        '</ul>'+
                              '<div id="'+id+'_BODY" class="tab-content">';

                for (var t in tabs)
                        {
                            theHTML += '<div page-block id="'+tabs[t].id+'_BODY" class="tab-pane Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" style="min-Height:150px;padding:5px;"></div>';
                        }

            theHTML +=             '</div>'+
                                '</div>'+
                        '</div>';

        return theHTML;

    }


    function getSVGTextHTML()
    {
        /*
        <div class="element svg" style="width: 270px; height: 270px; transform: translate3d(149px, 7px, 0px); opacity: 1;"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="-316 202.1 439.3 439.3" version="1.1" y="0px" x="0px" enable-background="new -316 202.1 439.3 439.3" class="baseColors" stroke="transparent" stroke-width="0" style="position: absolute;">
        <g>
            <path d="m123.3 421.8c0 28.4-24.9 51.7-35.1 76.4-10.6 25.6-9.9 59.6-29.2 78.9s-53.3 18.6-78.9 29.2c-24.7 10.3-48 35.1-76.4 35.1s-51.7-24.9-76.4-35.1c-25.6-10.6-59.6-9.9-78.9-29.2s-18.6-53.3-29.2-78.9c-10.3-24.7-35.2-48-35.2-76.4s24.9-51.7 35.1-76.4c10.6-25.6 9.9-59.6 29.2-78.9s53.3-18.6 78.9-29.2c24.8-10.3 48-35.2 76.5-35.2 28.4 0 51.7 24.9 76.4 35.1 25.6 10.6 59.6 9.9 78.9 29.2s18.6 53.3 29.2 78.9c10.2 24.8 35.1 48 35.1 76.5z" fill="#000000" class="color color-1 primaryColor" data-color="#fff"></path>
        </g>
        <g>
            <path d="m-96.2 627.8c-17.1 0-32-10-46.5-19.7-8.4-5.6-16.4-11-24.7-14.4-8.8-3.6-18.9-5.7-28.7-7.7-16.8-3.4-34.2-7-45.7-18.5s-15-28.9-18.5-45.7c-2-9.8-4.1-20-7.7-28.7-3.4-8.3-8.8-16.3-14.4-24.7-9.6-14.5-19.6-29.4-19.6-46.5s10-32 19.7-46.5c5.6-8.4 11-16.4 14.4-24.7 3.6-8.8 5.7-18.9 7.7-28.7 3.4-16.8 7-34.2 18.5-45.7s28.9-15 45.7-18.5c9.8-2 20-4.1 28.7-7.7 8.3-3.4 16.3-8.8 24.7-14.4 14.4-9.6 29.4-19.6 46.4-19.6s32 10 46.4 19.7c8.4 5.6 16.4 11 24.7 14.4 8.8 3.6 18.9 5.7 28.7 7.7 16.8 3.4 34.2 7 45.7 18.5s15 28.9 18.5 45.7c2 9.8 4.1 20 7.7 28.7 3.4 8.3 8.8 16.3 14.4 24.7 9.7 14.4 19.7 29.4 19.7 46.4 0 17.1-10 32-19.7 46.4-5.6 8.4-11 16.4-14.4 24.7-3.6 8.8-5.7 18.9-7.7 28.7-3.4 16.8-7 34.2-18.5 45.7s-28.9 15-45.7 18.5c-9.8 2-20 4.1-28.7 7.7-8.3 3.4-16.3 8.8-24.7 14.4-14.4 9.8-29.3 19.8-46.4 19.8zm0-409.7c-16.5 0-31.1 9.8-45.3 19.3-8.1 5.4-16.5 11.1-25 14.6-8.9 3.7-19.2 5.8-29.1 7.8-16.5 3.4-33.6 6.9-44.7 17.9-11.1 11.1-14.6 28.1-17.9 44.7-2 9.9-4.1 20.2-7.8 29.1-3.5 8.5-9.2 16.9-14.6 25-9.6 14.3-19.4 29-19.4 45.4s9.8 31.1 19.3 45.3c5.4 8.1 11.1 16.5 14.6 25 3.7 8.9 5.8 19.2 7.8 29.1 3.4 16.5 6.9 33.6 17.9 44.7 11.1 11.1 28.1 14.6 44.7 17.9 9.9 2 20.2 4.1 29.1 7.8 8.5 3.5 16.9 9.2 25 14.6 14.2 9.5 28.9 19.3 45.3 19.3s31.1-9.8 45.3-19.3c8.1-5.4 16.5-11.1 25-14.6 8.9-3.7 19.2-5.8 29.1-7.8 16.5-3.4 33.6-6.9 44.7-17.9 11.1-11.1 14.6-28.1 17.9-44.7 2-9.9 4.1-20.2 7.8-29.1 3.5-8.5 9.2-16.9 14.6-25 9.5-14.2 19.3-28.9 19.3-45.3 0-16.5-9.8-31.1-19.3-45.3-5.5-8.1-11.1-16.5-14.6-25-3.7-8.9-5.8-19.2-7.8-29.1-3.4-16.5-6.9-33.6-17.9-44.7-11.1-11.1-28.1-14.6-44.7-17.9-9.9-2-20.2-4.1-29.1-7.8-8.5-3.5-16.9-9.2-25-14.6-14-9.6-28.7-19.4-45.2-19.4z" fill="#ffffff" class="color color-2 secondaryColor" data-color="#272c33"></path>
        </g>
        <g class="canva"><rect x="-226.3" y="500" width="264" height="47.3" class="textPlaceholder" fill="none" data-fill="#272c33" data-font-size="13.68" data-font-name="Gidole" data-font-family="Gidole" data-bold="false" data-italic="false" data-justification="center" data-dynamic-font-size="false" data-dynamic-width="false" data-dynamic-height="false" data-placeholder-text="BEST QUALITY APPAREL"></rect></g>
        <g class="canva"><rect x="-237.3" y="370.2" width="288" height="134.3" class="textPlaceholder" fill="none" data-fill="#272c33" data-font-size="66.96" data-font-name="Granaina" data-font-family="Granaina" data-bold="false" data-italic="false" data-justification="center" data-dynamic-font-size="false" data-dynamic-width="false" data-dynamic-height="false" data-placeholder-text="SPIRITED"></rect></g>
        <g class="canva"><rect x="-227.3" y="303.6" width="264" height="35.6" class="textPlaceholder" fill="none" data-fill="#272c33" data-font-size="13.68" data-font-name="Gidole" data-font-family="Gidole" data-bold="false" data-italic="false" data-justification="center" data-dynamic-font-size="false" data-dynamic-width="false" data-dynamic-height="false" data-placeholder-text="SINCE 1991"></rect></g>
        </svg><div class="text" style="text-align: center; font-size: 145.156%; color: rgb(255, 255, 255); font-family: Gidole, sans-serif; line-height: 1.2; text-transform: none; left: 55px; top: 183px; width: 162px; height: 29px;"><div class="inner" contenteditable="false" style="width: 292.105px; position: absolute; transform: translate(-65px, 1px) scale(0.554615); height: 28px;">BEST QUALITY APPAREL</div></div><div class="text" style="text-align: center; font-size: 710.501%; color: rgb(255, 255, 255); font-family: Granaina, serif; line-height: 1.2; text-transform: none; left: 48px; top: 103px; width: 177px; height: 82px;"><div class="inner" contenteditable="false" style="width: 318.66px; position: absolute; transform: translate(-71px, -28px) scale(0.554615); height: 139px;">SPIRITED</div></div><div class="text" style="text-align: center; font-size: 145.156%; color: rgb(255, 255, 255); font-family: Gidole, sans-serif; line-height: 1.2; text-transform: none; left: 55px; top: 62px; width: 162px; height: 22px;"><div class="inner" contenteditable="false" style="width: 292.105px; position: absolute; transform: translate(-65px, -3px) scale(0.554615); height: 28px;">SINCE 1991</div></div></div>
        */
    }

    this.getDivider = function()
    {
    //return '<div  class="container-fluid featurette ndContainer"  ndType="container" >'+
          return  '<hr page-block ndType="divider"  class="featurette-divider" ndType="featureteDivider" style="padding: 5px;">';
      //      '</div>';

    }

    this.getImage = function(imageURL) {
        //return '<div page-block class="embed-responsive embed-responsive-16by9 ndContainer" ndtype="image" >'+
        return '<img page-block ndtype="image" class="img-responsive" src="' + imageURL + '" class="">';
        //      '</div>';
        //
        // }
    }

    this.getVideo = function()
    {
      var url = 'https://www.youtube.com/embed/OTsmsIeybQo';

          return   '<div page-block ndtype="container" class="embed-responsive embed-responsive-16by9" >'+
          '<iframe page-block ndtype="video" class="embed-responsive-item" src="'+url+'" style="padding: 5px;"></iframe>'+
        '</div>';
    }

    this.getParagraph = function()
    {
        return '<p page-block ndtype="paragraph" class="editable" >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>';
    }

    this.getPageHeader = function()
    {
        return '<div page-block ndtype="page-header" class="page-header"><h1 page-block ndtype="heading" class="editable">Lorem Ipsum</h1><p page-block ndtype="paragraph" class="editable">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p></div>';
    }

    this.getDefinitionList = function()
    {
        return '<dl page-block style="padding:5px;" ndType="dl"><dt page-block class="editable" ndType="dt">Lorem ipsum</dt><dd page-block ndType="dd" class="editable">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor... </dd><dt page-block ndType="dt" class="editable">Lorem ipsum</dt><dd page-block class="editable" ndType="dd">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...</dd></dl>';
    }

    this.getBlockQuote = function()
    {

    }

    this.getUnOrderedList = function()
    {

    }

    this.getHeading = function()
    {
        return '<h2 page-block ndtype="heading" class="editable">Lorem Ipsum</h2>';
    }




});
