angular.module('merchantApp')
	.directive("imagereader", ['imageSvc', 'toastr', '$log',
		function(imageSvc, toastr, $log) {
			return {
				require: 'ngModel',
				restrict: 'E',
				template: "<img class='img-polaroid'/><input id='fileInput' type='file' style='display: none;'/>",
				link: function(scope, element, attributes, ngModel) {
					var fileElement = $(angular.element('<input id="fileUpload" type="file" />')),
						imgElement = element.find('img')[0];
					
					fileElement.on('change', function(changeEvent) {
						var file = changeEvent.target.files[0];
						var regex = /^image\//i;

						if(regex.test(file.type)) {
							var reader = new FileReader();
							reader.onload = function(loadEvent) {
								var req_obj = {
									'image': loadEvent.target.result,
									'image_class': attributes.ngImageFor,
									'image_type': attributes.ngImageType
								};
								if(_id) {
									req_obj.id = _id;
								}
								imageSvc.uploadImage(req_obj).then(function(res) {
									_id = res.id;
									$(imgElement).attr('src', loadEvent.target.result);
									ngModel.$setViewValue(res.key);
								}, function(err) {
									console.log('error', err);
								});
							}
							reader.readAsDataURL(changeEvent.target.files[0]);
						}
						
					});
					element.bind('click', function() {
						fileElement.trigger('click');
					})
					element.css('cursor', 'pointer');
					scope.$watch(function() {
						return ngModel.$modelValue;
					}, function(v) {
						if(/^http/i.test(v)) {
							$(imgElement).attr('src', v);
						} else {
							$(imgElement).attr('src', 'https://s3.amazonaws.com/retwyst-merchants/retwyst-outlets/' + _id + '/' + v);
						}
					});
				}
			}
		}
	]);