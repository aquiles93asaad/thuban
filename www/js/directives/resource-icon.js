"user strict";

angular.module('ThubanApp')

.directive('resourceIcon', resourceIcon);

resourceIcon.$inject = []

function resourceIcon() {
    var directive = {
        link: link,
        scope: true,
        restrict: 'A'
    };

    return directive;

    function getIconClass(extension, withFa) {
        var iconClass = (withFa) ? 'fa ':'';
        if(extension == 'txt') {
            iconClass = iconClass + 'fa-file-text-o';
        } else if(extension == 'pdf') {
            iconClass = iconClass + 'fa-file-pdf-o';
        } else if(extension == 'doc' || extension == 'docx') {
            iconClass = iconClass + 'fa-file-word-o';
        } else if(extension == 'xls' || extension == 'xlsx') {
            iconClass = iconClass + 'fa-file-excel-o';
        } else if(extension == 'zip' || extension == 'rar') {
            iconClass = iconClass + 'fa-file-archive-o';
        } else if(extension == 'ppt' || extension == 'pptx') {
            iconClass = iconClass + 'fa-file-powerpoint-o';
        } else if(extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'pneg') {
            iconClass = iconClass + 'fa-file-image-o';
        }
        return iconClass;
    }

    function getIconSrc(extension) {
        var iconSrc = 'img/icons/';

        switch (extension) {
            case 'jpg':
            case 'jpeg':
                iconSrc = iconSrc + 'jpg-icon';
                break;

            case 'png':
            case 'pneg':
                iconSrc = iconSrc + 'png-icon';
                break;

            case 'tif':
            case 'tiff':
                iconSrc = iconSrc + 'tiff-icon';
                break;

            case 'pdf':
                iconSrc = iconSrc + 'pdf-icon';
                break;

            case 'txt':
                iconSrc = iconSrc + 'txt-icon';
                break;

            case 'doc':
            case 'docx':
                iconSrc = iconSrc + 'doc-icon';
                break;

            case 'xls':
            case 'xlsx':
                iconSrc = iconSrc + 'xls-icon';
                break;

            case 'ppt':
            case 'pptx':
                iconSrc = iconSrc + 'ppt-icon';
                break;

            case 'zip':
            case 'rar':
                iconSrc = iconSrc + 'zip-icon';
                break;

            default:
                iconSrc = iconSrc + 'x-icon';
                break;
        }

        return iconSrc + '.png';
    }

    function link (scope, element, attrs) {
        scope.$on('resource-changed', function(event, args) {
            if(attrs.type =='fa-icon') {
                element.addClass(getIconClass(angular.lowercase(args.extension), false));
            } else if(attrs.type == 'image') {
                element.attr('src', getIconSrc(angular.lowercase(args.extension)));
            }
        });

        if(attrs.type =='fa-icon') {
            element.addClass(getIconClass(angular.lowercase(attrs.extension), false));
        } else if(attrs.type == 'image') {
            element.attr('src', getIconSrc(angular.lowercase(attrs.extension)));
        }
    }
}
