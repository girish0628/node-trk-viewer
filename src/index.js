import vtkFullScreenRenderWindow from "vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow";

import vtkActor from "vtk.js/Sources/Rendering/Core/Actor";
import vtkMapper from "vtk.js/Sources/Rendering/Core/Mapper";
import vtkXMLPolyDataReader from "vtk.js/Sources/IO/XML/XMLPolyDataReader";
import vtkImageMapper from "vtk.js/Sources/Rendering/Core/ImageMapper";
import vtkImageSlice from "vtk.js/Sources/Rendering/Core/ImageSlice";

import itkReadImageArrayBuffer from "itk/readImageArrayBuffer";
import vtkITKImageReader from "vtk.js/Sources/IO/Misc/ITKImageReader";

import controlPanel from "./controller.html";

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
const interactor = renderWindow.getInteractor();
fullScreenRenderer.addController(controlPanel);

vtkITKImageReader.setReadImageArrayBufferFromITK(itkReadImageArrayBuffer);

const baseURL = "http://localhost:4000/data";
const volumeURL = `${baseURL}/fa.nii.gz`;
// const baseURL = "https://www.openanatomy.org/atlases/nac/abdomen-2016-09/Data";
// const volumeURL = `${baseURL}/I.nrrd`;

const imageActorI = vtkImageSlice.newInstance();
const imageActorJ = vtkImageSlice.newInstance();
const imageActorK = vtkImageSlice.newInstance();

renderer.addActor(imageActorK);
renderer.addActor(imageActorJ);
renderer.addActor(imageActorI);

const models = [
  "AF_left.trk",
  "Model_51_right_kidney.vtp",
  "Model_3_liver.vtp",
  "Model_25_right_hepatic_artery.vtp",
  "Model_131_right_psoas_muscle.vtp",
  "Model_126_right_renal_artery.vtp",
  "Model_25_right_hepatic_artery.vtp",
  "Model_151_right_hepatic_vein.vtp",
];

for (const model of models) {
  const modelURL = `${baseURL}/${model}`;
  const modelReader = vtkXMLPolyDataReader.newInstance();
  modelReader
    .setUrl(modelURL)
    .then(() => {
      const polydata = modelReader.getOutputData();
      const mapper = vtkMapper.newInstance();
      const actor = vtkActor.newInstance();
      actor.getProperty().setColor(0.8, 0.8, 0.6);
      mapper.setInputData(polydata);
      actor.setMapper(mapper);
      return actor;
    })
    .then((actor) => {
      renderer.addActor(actor);
      renderer.resetCamera();
      renderWindow.render();
    });
}

fetch(volumeURL)
  .then((response) => response.arrayBuffer())
  .then((arrayBuffer) => {
    const ireader = vtkITKImageReader.newInstance();
    ireader.setFileName("fa.nii.gz");

    ireader.parseAsArrayBuffer(arrayBuffer).then(() => {
      const data = ireader.getOutputData();
      console.log(
        "direction",
        data.getDirection(),
        "bounds",
        data.getBounds(),
        "spacing",
        data.getSpacing(),
        "origin",
        data.getOrigin()
      );

      const extent = data.getExtent();
      const spacing = data.getSpacing();

      const newOrigin = data.indexToWorld([extent[1], extent[3], 0]);
      data.setOrigin(newOrigin[0], newOrigin[1], newOrigin[2]);
      data.setSpacing(-1 * spacing[0], -1 * spacing[1], spacing[2]);

      console.log(
        "direction",
        data.getDirection(),
        "bounds",
        data.getBounds(),
        "spacing",
        data.getSpacing(),
        "origin",
        data.getOrigin()
      );

      const dataRange = data
        .getPointData()
        .getScalars()
        .getRange();
      console.log(dataRange);

      const imageMapperK = vtkImageMapper.newInstance();
      imageMapperK.setInputData(data);
      imageMapperK.setKSlice(30);
      imageActorK.setMapper(imageMapperK);

      const imageMapperJ = vtkImageMapper.newInstance();
      imageMapperJ.setInputData(data);
      imageMapperJ.setJSlice(30);
      imageActorJ.setMapper(imageMapperJ);

      const imageMapperI = vtkImageMapper.newInstance();
      imageMapperI.setInputData(data);
      imageMapperI.setISlice(30);
      imageActorI.setMapper(imageMapperI);

      renderer.resetCamera();
      renderer.resetCameraClippingRange();
      renderWindow.render();

      [".sliceI", ".sliceJ", ".sliceK"].forEach((selector, idx) => {
        const el = document.querySelector(selector);
        el.setAttribute("min", extent[idx * 2 + 0]);
        el.setAttribute("max", extent[idx * 2 + 1]);
        el.setAttribute("value", 30);
      });

      [".colorLevel", ".colorWindow"].forEach((selector) => {
        document.querySelector(selector).setAttribute("max", dataRange[1]);
        document.querySelector(selector).setAttribute("value", dataRange[1]);
      });

      document
        .querySelector(".colorLevel")
        .setAttribute("value", (dataRange[0] + dataRange[1]) / 2);
      updateColorLevel();
      updateColorWindow();
    });
  });

document.querySelector(".sliceI").addEventListener("input", (e) => {
  imageActorI.getMapper().setISlice(Number(e.target.value));
  renderWindow.render();
});

document.querySelector(".sliceJ").addEventListener("input", (e) => {
  imageActorJ.getMapper().setJSlice(Number(e.target.value));
  renderWindow.render();
});

document.querySelector(".sliceK").addEventListener("input", (e) => {
  imageActorK.getMapper().setKSlice(Number(e.target.value));
  renderWindow.render();
});

function updateColorLevel(e) {
  const colorLevel = Number(
    (e ? e.target : document.querySelector(".colorLevel")).value
  );
  imageActorI.getProperty().setColorLevel(colorLevel);
  imageActorJ.getProperty().setColorLevel(colorLevel);
  imageActorK.getProperty().setColorLevel(colorLevel);
  renderWindow.render();
}

function updateColorWindow(e) {
  const colorLevel = Number(
    (e ? e.target : document.querySelector(".colorWindow")).value
  );
  imageActorI.getProperty().setColorWindow(colorLevel);
  imageActorJ.getProperty().setColorWindow(colorLevel);
  imageActorK.getProperty().setColorWindow(colorLevel);
  renderWindow.render();
}

document
  .querySelector(".colorLevel")
  .addEventListener("input", updateColorLevel);
document
  .querySelector(".colorWindow")
  .addEventListener("input", updateColorWindow);

renderer.resetCamera();
renderWindow.render();
global.renderer = renderer;
