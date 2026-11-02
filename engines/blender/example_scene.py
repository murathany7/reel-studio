"""Example Blender scene: a cel-shaded blob hops on a coloured floor.

    engines/blender/render.sh engines/blender/example_scene.py /tmp/blob.mp4 --size 540x960 --duration 2
"""
import math

import bpy


def build(ctx):
    scene, toon, key = ctx["scene"], ctx["toon"], ctx["key"]
    d = ctx["duration"]

    # Backdrop colour seen by the camera only; it must not light the scene, or it flattens the toon bands.
    world = bpy.data.worlds.new("bg")
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes["Background"]
    bg.inputs[0].default_value = (1.0, 0.86, 0.72, 1)
    path, black, mix = nt.nodes.new("ShaderNodeLightPath"), nt.nodes.new("ShaderNodeBackground"), nt.nodes.new("ShaderNodeMixShader")
    black.inputs[0].default_value = (0, 0, 0, 1)
    nt.links.new(path.outputs["Is Camera Ray"], mix.inputs[0])
    nt.links.new(black.outputs[0], mix.inputs[1])
    nt.links.new(bg.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], nt.nodes["World Output"].inputs[0])
    scene.world = world

    bpy.ops.mesh.primitive_plane_add(size=40)
    bpy.context.object.data.materials.append(toon((1.0, 0.72, 0.5)))

    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=48, ring_count=24, location=(0, 0, 1))
    blob = bpy.context.object
    bpy.ops.object.shade_smooth()
    blob.data.materials.append(toon((0.93, 0.42, 0.09)))

    # Hop: squash, rise, fall, squash, settle (same beats as SvgRig.hop).
    for t, z, sx, sz in [(0, 1, 1, 1), (0.1 * d, 0.85, 1.1, 0.85), (0.35 * d, 2.6, 0.92, 1.1),
                         (0.6 * d, 1, 1, 1), (0.67 * d, 0.88, 1.08, 0.88), (0.8 * d, 1, 1, 1), (d, 1, 1, 1)]:
        key(blob, "location", t, (0, 0, z))
        key(blob, "scale", t, (sx, sx, sz))

    bpy.ops.object.light_add(type="SUN", rotation=(math.radians(50), 0, math.radians(30)))
    bpy.context.object.data.energy = 4

    bpy.ops.object.camera_add(location=(0, -11, 3.2), rotation=(math.radians(82), 0, 0))
    scene.camera = bpy.context.object
    scene.camera.data.lens = 40
