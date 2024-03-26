$(document).ready(function() {
    var layers = [];
    var activeLayerIndex = 0;
    var nestedDrawings = [];
    var directoryPath = ['root'];

    function createLayer() {
        var canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.classList.add('layer');
        if (layers.length === 0) {
            canvas.classList.add('active');
        } else {
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        $('.drawing-container').append(canvas);
        layers.push(canvas);
        updateLayerManager();

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        canvas.dataset.visible = 'true';
        return canvas;
    }

    function setActiveLayer(index) {
        layers[activeLayerIndex].classList.remove('active');
        $('.layer-thumbnail[data-index="' + activeLayerIndex + '"]').removeClass('active');
        activeLayerIndex = index;
        layers[activeLayerIndex].classList.add('active');
        $('.layer-thumbnail[data-index="' + activeLayerIndex + '"]').addClass('active');
        updateLayerManager();
    }

    function updateLayerThumbnail(index) {
        var thumbnail = $('.layer-thumbnail[data-index="' + index + '"]');
        var thumbnailCtx = thumbnail[0].getContext('2d');
        thumbnailCtx.clearRect(0, 0, thumbnail.width(), thumbnail.height());
        thumbnailCtx.drawImage(layers[index], 0, 0, layers[index].width, layers[index].height, 0, 0, thumbnail.width(), thumbnail.height());
    }

    function updateLayerManager() {
        var layerManager = $('.layer-manager');
        layerManager.empty();

        layers.forEach(function(layer, index) {
            var thumbnailContainer = $('<div>').addClass('layer-thumbnail-container');
            var thumbnail = $('<canvas>').addClass('layer-thumbnail').attr('data-index', index);
            thumbnail.attr('width', 100).attr('height', 100);
            if (index === activeLayerIndex) {
                thumbnail.addClass('active');
            }
            thumbnailContainer.append(thumbnail);

            var toggle = $('<input>').attr('type', 'checkbox').addClass('layer-toggle').prop('checked', layer.dataset.visible === 'true');
            toggle.change(function() {
                var layerIndex = parseInt($(this).siblings('.layer-thumbnail').attr('data-index'));
                var isVisible = $(this).is(':checked');
                layers[layerIndex].style.display = isVisible ? 'block' : 'none';
                layers[layerIndex].dataset.visible = isVisible ? 'true' : 'false';
            });

            thumbnailContainer.append(toggle);
            layerManager.append(thumbnailContainer);

            thumbnail.click(function() {
                var clickedIndex = parseInt($(this).attr('data-index'));
                setActiveLayer(clickedIndex);
            });

            updateLayerThumbnail(index);
        });
    }

    function updateDirectoryPath() {
        var pathString = directoryPath.join(' > ');
        $('.directory-path').text(pathString);
    }

    function createNestedDrawing(x, y) {
        var nestedDrawingButton = $('<div>').addClass('nested-drawing-button').css({
            left: x,
            top: y
        });

        var nestedDrawingContainer = $('<div>').addClass('nested-drawing-container');
        var nestedDrawing = $('<div>').addClass('nested-drawing');

        var nestedLayerManager = $('<div>').addClass('nested-layer-manager');

        var nestedLayers = [];
        var activeNestedLayerIndex = 0;

        function createNestedLayer() {
            var nestedCanvas = $('<canvas>').addClass('nested-drawing-canvas').attr({
                width: window.innerWidth,
                height: window.innerHeight
            });
            if (nestedLayers.length === 0) {
                nestedCanvas.addClass('active');
            } else {
                var ctx = nestedCanvas[0].getContext('2d');
                ctx.fillStyle = 'rgba(0, 0, 0, 0)';
                ctx.fillRect(0, 0, nestedCanvas.width(), nestedCanvas.height());
            }
            nestedDrawing.append(nestedCanvas);
            nestedLayers.push(nestedCanvas[0]);
            updateNestedLayerManager();

            nestedCanvas.on('mousedown', function(e) {
                e.stopPropagation();
                startDrawingNested(e, nestedCanvas[0]);
            });

            nestedCanvas.on('mousemove', function(e) {
                e.stopPropagation();
                drawNested(e, nestedCanvas[0]);
            });

            nestedCanvas.on('mouseup', function(e) {
                e.stopPropagation();
                stopDrawingNested();
            });

            nestedCanvas.on('mouseout', function(e) {
                e.stopPropagation();
                stopDrawingNested();
            });

            nestedCanvas[0].dataset.visible = 'true';
            return nestedCanvas[0];
        }

        function setActiveNestedLayer(index) {
            nestedLayers[activeNestedLayerIndex].classList.remove('active');
            $('.nested-layer-thumbnail[data-index="' + activeNestedLayerIndex + '"]').removeClass('active');
            activeNestedLayerIndex = index;
            nestedLayers[activeNestedLayerIndex].classList.add('active');
            $('.nested-layer-thumbnail[data-index="' + activeNestedLayerIndex + '"]').addClass('active');
            updateNestedLayerManager();
        }

        function updateNestedLayerThumbnail(index) {
            var thumbnail = $('.nested-layer-thumbnail[data-index="' + index + '"]');
            var thumbnailCtx = thumbnail[0].getContext('2d');
            thumbnailCtx.clearRect(0, 0, thumbnail.width(), thumbnail.height());
            thumbnailCtx.drawImage(nestedLayers[index], 0, 0, nestedLayers[index].width, nestedLayers[index].height, 0, 0, thumbnail.width(), thumbnail.height());
        }

        function updateNestedLayerManager() {
            nestedLayerManager.empty();

            nestedLayers.forEach(function(layer, index) {
                var thumbnailContainer = $('<div>').addClass('nested-layer-thumbnail-container');
                var thumbnail = $('<canvas>').addClass('nested-layer-thumbnail').attr('data-index', index);
                thumbnail.attr('width', 100).attr('height', 100);
                if (index === activeNestedLayerIndex) {
                    thumbnail.addClass('active');
                }
                thumbnailContainer.append(thumbnail);

                var toggle = $('<input>').attr('type', 'checkbox').addClass('nested-layer-toggle').prop('checked', layer.dataset.visible === 'true');
                toggle.change(function() {
                    var layerIndex = parseInt($(this).siblings('.nested-layer-thumbnail').attr('data-index'));
                    var isVisible = $(this).is(':checked');
                    nestedLayers[layerIndex].style.display = isVisible ? 'block' : 'none';
                    nestedLayers[layerIndex].dataset.visible = isVisible ? 'true' : 'false';
                });

                thumbnailContainer.append(toggle);
                nestedLayerManager.append(thumbnailContainer);

                thumbnail.click(function() {
                    var clickedIndex = parseInt($(this).attr('data-index'));
                    setActiveNestedLayer(clickedIndex);
                });

                updateNestedLayerThumbnail(index);
            });
        }

        var nameInput = $('<input>').addClass('nested-drawing-name').attr('type', 'text').attr('placeholder', 'Enter a name');

        var closeButton = $('<div>').addClass('close-nested-drawing').text('Close');

        nestedDrawingContainer.append(nestedDrawing, nestedLayerManager, nameInput, closeButton);
        $('.drawing-container').append(nestedDrawingButton, nestedDrawingContainer);

        nestedDrawings.push({
            button: nestedDrawingButton,
            container: nestedDrawingContainer,
            layers: nestedLayers,
            name: ''
        });

        var isDraggingButton = false;
        var buttonOffsetX = 0;
        var buttonOffsetY = 0;

        nestedDrawingButton.on('mousedown', function(e) {
            isDraggingButton = true;
            buttonOffsetX = e.clientX - nestedDrawingButton.offset().left;
            buttonOffsetY = e.clientY - nestedDrawingButton.offset().top;
        });

        $(document).on('mousemove', function(e) {
            if (isDraggingButton) {
                var newX = e.clientX - buttonOffsetX;
                var newY = e.clientY - buttonOffsetY;
                nestedDrawingButton.css({
                    left: newX,
                    top: newY
                });
            }
        });

        $(document).on('mouseup', function() {
            isDraggingButton = false;
        });

        nestedDrawingButton.on('dblclick', function() {
            openNestedDrawing(nestedDrawingButton);
            directoryPath.push(nestedDrawing.name || 'Untitled');
            updateDirectoryPath();
        });

        closeButton.on('click', function() {
            closeNestedDrawing(nestedDrawingContainer);
        });

        nameInput.on('input', function() {
            var nestedDrawing = nestedDrawings.find(function(drawing) {
                return drawing.container[0] === nestedDrawingContainer[0];
            });

            if (nestedDrawing) {
                nestedDrawing.name = $(this).val();
            }
        });

        createNestedLayer();
    }

    function openNestedDrawing(button) {
        var nestedDrawing = nestedDrawings.find(function(drawing) {
            return drawing.button[0] === button[0];
        });

        if (nestedDrawing) {
            nestedDrawing.container.show();
        }
    }

    function closeNestedDrawing(container) {
        container.hide();
        directoryPath.pop();
        updateDirectoryPath();
    }

    createLayer();

    var isDrawing = false;
    var lastX = 0;
    var lastY = 0;

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;
        var canvas = layers[activeLayerIndex];
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
        updateLayerThumbnail(activeLayerIndex);
    }

    function stopDrawing() {
        isDrawing = false;
    }

    var isDrawingNested = false;
    var lastXNested = 0;
    var lastYNested = 0;

    function startDrawingNested(e, nestedDrawing) {
        isDrawingNested = true;
        [lastXNested, lastYNested] = [e.offsetX, e.offsetY];
    }

    function drawNested(e, nestedDrawing) {
        if (!isDrawingNested) return;
        var ctx = nestedDrawing.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(lastXNested, lastYNested);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastXNested, lastYNested] = [e.offsetX, e.offsetY];
    }

    function stopDrawingNested() {
        isDrawingNested = false;
    }

    $('#new-layer-btn').click(function() {
        createLayer();
        setActiveLayer(layers.length - 1);
    });

    $('#new-nested-drawing-btn').click(function() {
        var x = 100;
        var y = 100;
        createNestedDrawing(x, y);
    });

    $('#save-btn').click(function() {
        var layerData = [];
        layers.forEach(function(layer) {
            layerData.push(layer.toDataURL());
        });

        $.ajax({
            type: 'POST',
            url: '/save',
            data: JSON.stringify({ layers: layerData }),
            contentType: 'application/json',
            success: function(response) {
                console.log('Drawing saved successfully');
            },
            error: function(error) {
                console.error('Error saving drawing:', error);
            }
        });
    });

    $('#load-btn').click(function() {
        $('#load-file').click();
    });

    $('#load-file').change(function(e) {
        var file = e.target.files[0];
        var formData = new FormData();
        formData.append('file', file);

        $.ajax({
            type: 'POST',
            url: '/load',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                layers.forEach(function(layer) {
                    $('.drawing-container').remove(layer);
                });
                layers = [];
                activeLayerIndex = 0;

                response.forEach(function(layerData) {
                    var canvas = createLayer();
                    var ctx = canvas.getContext('2d');
                    var img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0);
                        updateLayerManager();
                    };
                    img.src = 'data:image/png;base64,' + layerData;
                });
            },
            error: function(error) {
                console.error('Error loading drawing:', error);
            }
        });
    });

    updateDirectoryPath();
});
