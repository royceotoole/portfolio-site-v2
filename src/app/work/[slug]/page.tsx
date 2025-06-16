'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/supabase'

export default function ProjectPage() {
  const { slug } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  useEffect(() => {
    const fetchProject = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single()

      if (data) {
        setProject(data)
      }
    }

    fetchProject()
  }, [slug])

  if (!project) {
    return null
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="font-quadrant text-4xl mb-8">{project.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Project Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-gt-america-mono text-sm mb-4">Info</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="font-gt-america-mono">Type</dt>
                  <dd>{project.type.join(', ')}</dd>
                </div>
                <div>
                  <dt className="font-gt-america-mono">Role</dt>
                  <dd>{project.role.join(', ')}</dd>
                </div>
                <div>
                  <dt className="font-gt-america-mono">Year</dt>
                  <dd>{project.year}</dd>
                </div>
                <div>
                  <dt className="font-gt-america-mono">Company</dt>
                  <dd>{project.company}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="font-gt-america-mono text-sm mb-4">Description</h2>
              <p className="whitespace-pre-wrap">{project.description_long}</p>
            </div>
          </div>

          {/* Media Gallery */}
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMediaIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-[4/3] mb-4"
              >
                <Image
                  src={project.media[currentMediaIndex]}
                  alt={`${project.name} - Image ${currentMediaIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-6 gap-2">
              {project.media.map((media, index) => (
                <button
                  key={media}
                  onClick={() => setCurrentMediaIndex(index)}
                  className={`relative aspect-square ${
                    index === currentMediaIndex ? 'ring-2 ring-black' : ''
                  }`}
                >
                  <Image
                    src={media}
                    alt={`${project.name} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 