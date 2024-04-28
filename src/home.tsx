import { ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import { useEffect, useState } from "react";
import * as FaceDetector from "expo-face-detector";
import Animated, {useSharedValue, useAnimatedStyle} from "react-native-reanimated"

import imgNeutro from '../src/assets/neutro.png';
import smiling from '../src/assets/smiling.png';
import winking from '../src/assets/winking.png';

export default function Home() {
  const [permissao, solicitarPermissao] = Camera.useCameraPermissions(); // Solitar Permissão, para usar a camerar
  const [rostoIdentificado, setRostoIndentificado] = useState(false);
    const [emoji, setEmoji] = useState<ImageSourcePropType>(imgNeutro)

  const dadosDoRosto = useSharedValue({
    width:0,
    height:0,
    x:0,
    y:0
  })

  function detectarFace({ faces }: FaceDetectionResult) { // Essa função é responsavel por indentificar o rosto
    const rosto = faces[0] as any; // aqui estou pegando o primeiro rosto que aparecer 

    if (rosto) {
      const {size,origin} = rosto.bounds; // pego o tamanho e a origem dele
      
      dadosDoRosto.value = { // informo os dados do resto
        width : size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      }
      setRostoIndentificado(true);     // mudo o status de rosto identificado para verdadeiro

      if(rosto.smilingProbability> 0.5){ // verificação simples, se a propabilidade de sorrir é mairo que 50% eu colo um emoji de sorrindo
        setEmoji(smiling)
      }else if(rosto.leftEyeOpenProbability > 0.5 && rosto.rightEyeOpenProbability < 0.4){
        setEmoji(winking) // Caso o olhe esquerdo estiver fechado e olho direito aberto, colo emoji de piscando
      }
      else{
        setEmoji(imgNeutro) // emoji padrão 
      }
    

    } else {

      setRostoIndentificado(false);
      
    }

    
  }


  const animatedStyle = useAnimatedStyle(() =>({    
    position:'absolute',
    zIndex:1,
    width: dadosDoRosto.value.width,
    height: dadosDoRosto.value.height,
    transform: [
      {translateX : dadosDoRosto.value.x},
      {translateY : dadosDoRosto.value.y + 300},

    ],      
  }));
  useEffect(() => {
    solicitarPermissao();
  }, []);

  if (!permissao?.granted) {
    return;
  }
  return (
    <View style={styles.container}>
         <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={detectarFace}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
        
      {rostoIdentificado && <Animated.Image source={emoji} style={animatedStyle}/> 
      
      }

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  camera: {
    flex: 1,
  },
});
