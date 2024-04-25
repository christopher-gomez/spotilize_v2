import React from "react";
import { useTexture } from "@react-three/drei";
import wood from "../../../../Assets/Textures/wood.jpg";

export default function WoodenBox({ position, size }) {
    const woodTexture = useTexture(wood);
  
    // Assuming the wood box has a small thickness
    const thickness = 2;
    const height = 4; // The height of the wooden box
  
    // Size and position of the planks
    const plankSize = {
      length: size.length,
      width: thickness,
      height: height,
    };
  
    // Positions are calculated based on the size of the water and the desired position of the box
    const positions = {
      front: [position[0], position[1] + plankSize.height / 2, position[2] - size.width / 2 - plankSize.width / 2],
      back: [position[0], position[1] + plankSize.height / 2, position[2] + size.width / 2 + plankSize.width / 2],
      left: [position[0] - size.length / 2 - plankSize.width / 2, position[1] + plankSize.height / 2, position[2]],
      right: [position[0] + size.length / 2 + plankSize.width / 2, position[1] + plankSize.height / 2, position[2]],
    };
  
    // Helper function to create a plank mesh
    const createPlank = (pos, rotY) => (
      <mesh position={pos} rotation={[0, rotY, 0]}>
        <boxGeometry args={[plankSize.length, plankSize.height, plankSize.width]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>
    );
  
    return (
      <group>
        {/* Front and back planks */}
        {createPlank(positions.front, 0)}
        {createPlank(positions.back, 0)}
        {/* Left and right planks */}
        {createPlank(positions.left, Math.PI / 2)}
        {createPlank(positions.right, Math.PI / 2)}
      </group>
    );
  }
  