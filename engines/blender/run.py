"""Runs inside Blender (called by render.sh). Sets up an empty scene at the
export size, imports the scene script, calls its build(ctx), renders frames.

ctx is a dict: size (w, h), fps, duration, frames (count), scene (bpy scene),
and helpers: toon(color) for a cel-shaded material, key(obj, path, t, value)
to keyframe a property at a time in seconds.
"""
import argparse
import importlib.util
import os
import sys

import bpy


def parse():
    argv = sys.argv[sys.argv.index("--") + 1:]
    p = argparse.ArgumentParser()
    p.add_argument("scene")
    p.add_argument("frames")
    p.add_argument("--size", default="1080x1920")
    p.add_argument("--fps", type=int, default=30)
    p.add_argument("--duration", type=float, default=4.0)
    p.add_argument("--engine", default="EEVEE")
    return p.parse_args(argv)


def toon(color, steps=3):
    """Cel-shaded material: diffuse light snapped to `steps` bands, times the colour."""
    m = bpy.data.materials.new("toon")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    diffuse = nt.nodes.new("ShaderNodeBsdfDiffuse")
    to_rgb = nt.nodes.new("ShaderNodeShaderToRGB")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "CONSTANT"
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = 0.0, (0.35, 0.35, 0.35, 1)
    els[1].position, els[1].color = 1.0 / steps * (steps - 1), (1, 1, 1, 1)
    for i in range(1, steps - 1):
        e = els.new(i / steps)
        v = 0.35 + 0.65 * i / (steps - 1)
        e.color = (v, v, v, 1)
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs[0].default_value = 1.0
    mix.inputs[7].default_value = (*color, 1)
    emit = nt.nodes.new("ShaderNodeEmission")
    outn = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(diffuse.outputs[0], to_rgb.inputs[0])
    nt.links.new(to_rgb.outputs[0], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], mix.inputs[6])
    nt.links.new(mix.outputs[2], emit.inputs[0])
    nt.links.new(emit.outputs[0], outn.inputs[0])
    return m


def main():
    a = parse()
    w, h = map(int, a.size.split("x"))
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 100
    scene.render.fps = a.fps
    frames = round(a.duration * a.fps)
    scene.frame_start, scene.frame_end = 1, frames
    # Eevee's id is BLENDER_EEVEE_NEXT in Blender 4.2–4.x and BLENDER_EEVEE before and after.
    engines = {e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items}
    eevee = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    scene.render.engine = {"EEVEE": eevee, "CYCLES": "CYCLES", "WORKBENCH": "BLENDER_WORKBENCH"}[a.engine]
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = a.frames
    scene.view_settings.view_transform = "Standard"  # flat brand colours, not Filmic/AgX

    def key(obj, path, t, value):
        """Keyframe obj.<path> (e.g. "location", "rotation_euler", "scale") to value at t seconds."""
        setattr(obj, path, value)
        obj.keyframe_insert(data_path=path, frame=1 + t * a.fps)

    spec = importlib.util.spec_from_file_location("scene", a.scene)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.build({"size": (w, h), "fps": a.fps, "duration": a.duration, "frames": frames,
               "scene": scene, "toon": toon, "key": key})
    print("FPS", a.fps, flush=True)
    bpy.ops.render.render(animation=True)
    # Blender names frames f_0001.png...; render.sh expects f_00000.png from 0.
    d, prefix = os.path.split(a.frames)
    for i in range(1, frames + 1):
        os.rename(os.path.join(d, f"{prefix}{i:04d}.png"), os.path.join(d, f"{prefix}{i - 1:05d}.png"))


main()
